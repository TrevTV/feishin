import { useMemo } from 'react';
import { Stack, Group, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { RiDeleteBin2Fill, RiEdit2Fill } from 'react-icons/ri';
import { queryKeys } from '@/renderer/api/query-keys';
import { Server, TaskType } from '@/renderer/api/types';
import { Button, Switch, Text, toast } from '@/renderer/components';
import { AddServerCredentialForm } from '@/renderer/features/servers/components/add-server-credential-form';
import { AddServerUrlForm } from '@/renderer/features/servers/components/add-server-url-form';
import { EditServerForm } from '@/renderer/features/servers/components/edit-server-form';
import { ServerSection } from '@/renderer/features/servers/components/server-section';
import { useDeleteServerUrl } from '@/renderer/features/servers/mutations/use-delete-server-url';
import { useDisableServerFolder } from '@/renderer/features/servers/mutations/use-disable-server-folder';
import { useDisableServerUrl } from '@/renderer/features/servers/mutations/use-disable-server-url';
import { useEnableServerFolder } from '@/renderer/features/servers/mutations/use-enable-server-folder';
import { useEnableServerUrl } from '@/renderer/features/servers/mutations/use-enable-server-url';
import { useFullScan } from '@/renderer/features/servers/mutations/use-full-scan';
import { useQuickScan } from '@/renderer/features/servers/mutations/use-quick-scan';
import { useUpdateServer } from '@/renderer/features/servers/mutations/use-update-server';
import { usePermissions } from '@/renderer/features/shared';
import { useTaskList } from '@/renderer/features/tasks';
import { useAuthStore } from '@/renderer/store';
import { Font } from '@/renderer/styles';

interface ServerListItemProps {
  server: Server;
}

export const ServerListItem = ({ server }: ServerListItemProps) => {
  const queryClient = useQueryClient();
  const [edit, editHandlers] = useDisclosure(false);
  const [addUrl, addUrlHandlers] = useDisclosure(false);
  const [addCredential, addCredentialHandlers] = useDisclosure(false);

  const permissions = usePermissions();
  const updateServer = useUpdateServer();
  const enableServerUrl = useEnableServerUrl();
  const disableServerUrl = useDisableServerUrl();
  const deleteServerUrl = useDeleteServerUrl();
  const enableServerFolder = useEnableServerFolder();
  const disableServerFolder = useDisableServerFolder();
  const fullScan = useFullScan();
  const quickScan = useQuickScan();
  const { data: tasks } = useTaskList();

  const isRunningTask = useMemo(() => {
    return tasks?.data.some(
      (task) =>
        task.server?.id === server.id &&
        (task.type === TaskType.FULL_SCAN || task.type === TaskType.QUICK_SCAN)
    );
  }, [server.id, tasks?.data]);

  const serverCredentials = useAuthStore(
    (state) => state.serverCredentials
  ).filter((credential) => credential.serverId === server.id);

  const handleFullScan = () => {
    fullScan.mutate(
      { body: {}, query: { serverId: server.id } },
      {
        onSuccess: () => {
          toast.show({ message: 'Full scan started', type: 'info' });
          queryClient.invalidateQueries(queryKeys.tasks.root);
        },
      }
    );
  };

  const handleQuickScan = () => {
    quickScan.mutate(
      { body: {}, query: { serverId: server.id } },
      {
        onSuccess: () => {
          toast.show({ message: 'Quick scan started', type: 'info' });
          queryClient.invalidateQueries(queryKeys.tasks.root);
        },
      }
    );
  };

  const toggleRequiredCredential = (e: boolean) => {
    updateServer.mutate({
      body: { noCredential: e, type: server.type },
      query: { serverId: server.id },
    });
  };

  const enableServerCredential = useAuthStore(
    (state) => state.enableServerCredential
  );

  const disableServerCredential = useAuthStore(
    (state) => state.disableServerCredential
  );

  const deleteServerCredential = useAuthStore(
    (state) => state.deleteServerCredential
  );

  const handleToggleCredential = (credentialId: string, enabled: boolean) => {
    if (enabled) {
      return disableServerCredential({ id: credentialId });
    }

    return enableServerCredential({ id: credentialId });
  };

  const handleDeleteCredential = (credentialId: string) => {
    deleteServerCredential({ id: credentialId });
  };

  const handleToggleUrl = (urlId: string, enabled: boolean) => {
    if (enabled) {
      return disableServerUrl.mutate({ query: { serverId: server.id, urlId } });
    }

    return enableServerUrl.mutate({ query: { serverId: server.id, urlId } });
  };

  const handleDeleteUrl = (urlId: string) => {
    deleteServerUrl.mutate({
      query: {
        serverId: server.id,
        urlId,
      },
    });
  };

  const handleToggleFolder = (folderId: string, enabled: boolean) => {
    if (enabled) {
      return disableServerFolder.mutate({
        query: { folderId, serverId: server.id },
      });
    }

    return enableServerFolder.mutate({
      query: { folderId, serverId: server.id },
    });
  };

  return (
    <>
      <Stack mt="1rem" spacing="xl">
        <ServerSection
          title={
            <Group position="apart">
              <Text font={Font.EPILOGUE}>Server details</Text>
              <Group spacing="md">
                <Button
                  compact
                  disabled={isRunningTask}
                  loading={fullScan.isLoading}
                  variant="subtle"
                  onClick={handleFullScan}
                >
                  Full scan
                </Button>
                <Button
                  compact
                  disabled={true || isRunningTask}
                  variant="filled"
                  onClick={handleQuickScan}
                >
                  Quick scan
                </Button>
              </Group>
            </Group>
          }
        >
          {edit ? (
            <EditServerForm
              server={server}
              onCancel={() => editHandlers.toggle()}
            />
          ) : (
            <Group position="apart">
              <Group>
                <Stack>
                  <Text>URL</Text>
                  <Text>Username</Text>
                </Stack>
                <Stack>
                  <Text>{server.url}</Text>
                  <Text>{server.username}</Text>
                </Stack>
              </Group>
              <Group>
                {permissions.editServer && (
                  <Button
                    tooltip={{ label: 'Edit server details' }}
                    variant="default"
                    onClick={() => editHandlers.toggle()}
                  >
                    <RiEdit2Fill color="white" />
                  </Button>
                )}
              </Group>
            </Group>
          )}
        </ServerSection>
        <ServerSection title="Music Folders">
          <Stack>
            {server.serverFolders?.map((folder) => (
              <Group key={folder.id} position="apart">
                <Text>{folder.name}</Text>
                <Group>
                  {permissions.deleteServerFolder && (
                    <Button compact disabled radius="xl" variant="subtle">
                      <RiDeleteBin2Fill />
                    </Button>
                  )}
                  <Switch
                    checked={folder.enabled}
                    onChange={(e) =>
                      handleToggleFolder(folder.id, !e.currentTarget.checked)
                    }
                  />
                </Group>
              </Group>
            ))}
          </Stack>
        </ServerSection>
        <ServerSection title="Credentials">
          {addCredential ? (
            <AddServerCredentialForm
              server={server}
              onCancel={() => addCredentialHandlers.close()}
            />
          ) : (
            <>
              <Stack>
                {serverCredentials?.map((credential) => (
                  <Group key={credential.id} position="apart">
                    <Text>{credential.username}</Text>
                    <Group>
                      {permissions.deleteServerCredential && (
                        <Button
                          compact
                          radius="xl"
                          variant="subtle"
                          onClick={() => handleDeleteCredential(credential.id)}
                        >
                          <RiDeleteBin2Fill />
                        </Button>
                      )}
                      <Switch
                        checked={credential.enabled}
                        onChange={(e) =>
                          handleToggleCredential(
                            credential.id,
                            !e.currentTarget.checked
                          )
                        }
                      />
                    </Group>
                  </Group>
                ))}
              </Stack>
              {permissions.createServerCredential && (
                <Button
                  compact
                  mt={10}
                  variant="default"
                  onClick={() => addCredentialHandlers.open()}
                >
                  Add credential
                </Button>
              )}
            </>
          )}
        </ServerSection>
        <ServerSection title="URLs">
          {addUrl ? (
            <AddServerUrlForm
              serverId={server.id}
              onCancel={() => addUrlHandlers.close()}
            />
          ) : (
            <>
              <Stack>
                {server.serverUrls?.map((serverUrl) => (
                  <Group key={serverUrl.id} position="apart">
                    <Text>{serverUrl.url}</Text>
                    <Group>
                      {permissions.deleteServerUrl && (
                        <Button
                          compact
                          radius="xl"
                          variant="subtle"
                          onClick={() => handleDeleteUrl(serverUrl.id)}
                        >
                          <RiDeleteBin2Fill />
                        </Button>
                      )}
                      <Switch
                        checked={serverUrl.enabled}
                        onChange={(e) =>
                          handleToggleUrl(
                            serverUrl.id,
                            !e.currentTarget.checked
                          )
                        }
                      />
                    </Group>
                  </Group>
                ))}
              </Stack>
              {permissions.createServerUrl && (
                <Button
                  compact
                  mt={10}
                  variant="default"
                  onClick={() => addUrlHandlers.open()}
                >
                  Add URL
                </Button>
              )}
            </>
          )}
        </ServerSection>

        <ServerSection title="Danger zone">
          <Group position="apart">
            <Text>Require user credentials</Text>
            <Switch
              checked={server.noCredential}
              onChange={(e) =>
                toggleRequiredCredential(e.currentTarget.checked)
              }
            />
          </Group>
          <Divider my="xl" />
          {permissions.deleteServer && (
            <Button compact color="red" leftIcon={<RiDeleteBin2Fill />}>
              Delete server
            </Button>
          )}
        </ServerSection>
      </Stack>
    </>
  );
};
