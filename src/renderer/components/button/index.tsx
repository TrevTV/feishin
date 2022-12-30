import type { Ref } from 'react';
import React, { useRef, useCallback, useState, forwardRef } from 'react';
import type { ButtonProps as MantineButtonProps, TooltipProps } from '@mantine/core';
import { Button as MantineButton, createPolymorphicComponent } from '@mantine/core';
import { useTimeout } from '@mantine/hooks';
import styled from 'styled-components';
import { Spinner } from '/@/renderer/components/spinner';
import { Tooltip } from '/@/renderer/components/tooltip';

export interface ButtonProps extends MantineButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  tooltip?: Omit<TooltipProps, 'children'>;
}

interface StyledButtonProps extends ButtonProps {
  ref: Ref<HTMLButtonElement>;
}

const StyledButton = styled(MantineButton)<StyledButtonProps>`
  color: ${(props) => {
    switch (props.variant) {
      case 'default':
        return 'var(--btn-default-fg)';
      case 'filled':
        return 'var(--btn-primary-fg)';
      case 'subtle':
        return 'var(--btn-subtle-fg)';
      default:
        return '';
    }
  }};
  background: ${(props) => {
    switch (props.variant) {
      case 'default':
        return 'var(--btn-default-bg)';
      case 'filled':
        return 'var(--btn-primary-bg)';
      case 'subtle':
        return 'var(--btn-subtle-bg)';
      default:
        return '';
    }
  }};
  border: none;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

  svg {
    transition: fill 0.2s ease-in-out;
    fill: ${(props) => {
      switch (props.variant) {
        case 'default':
          return 'var(--btn-default-fg)';
        case 'filled':
          return 'var(--btn-primary-fg)';
        case 'subtle':
          return 'var(--btn-subtle-fg)';
        default:
          return '';
      }
    }};
  }

  &:disabled {
    color: ${(props) => {
      switch (props.variant) {
        case 'default':
          return 'var(--btn-default-fg)';
        case 'filled':
          return 'var(--btn-primary-fg)';
        case 'subtle':
          return 'var(--btn-subtle-fg)';
        default:
          return '';
      }
    }};
    background: ${(props) => {
      switch (props.variant) {
        case 'default':
          return 'var(--btn-default-bg)';
        case 'filled':
          return 'var(--btn-primary-bg)';
        case 'subtle':
          return 'var(--btn-subtle-bg)';
        default:
          return '';
      }
    }};

    opacity: 0.6;
  }

  &:hover {
    color: ${(props) => {
      switch (props.variant) {
        case 'default':
          return 'var(--btn-default-fg-hover)';
        case 'filled':
          return 'var(--btn-primary-fg-hover)';
        case 'subtle':
          return 'var(--btn-subtle-fg-hover)';
        default:
          return '';
      }
    }};
    background: ${(props) => {
      switch (props.variant) {
        case 'default':
          return 'var(--btn-default-bg-hover)';
        case 'filled':
          return 'var(--btn-primary-bg-hover)';
        case 'subtle':
          return 'var(--btn-subtle-bg-hover)';
        default:
          return '';
      }
    }};

    svg {
      fill: ${(props) => {
        switch (props.variant) {
          case 'default':
            return 'var(--btn-default-fg-hover)';
          case 'filled':
            return 'var(--btn-primary-fg-hover)';
          case 'subtle':
            return 'var(--btn-subtle-fg-hover)';
          default:
            return '';
        }
      }};
    }
  }

  &:focus-visible {
    color: ${(props) => {
      switch (props.variant) {
        case 'default':
          return 'var(--btn-default-fg-hover)';
        case 'filled':
          return 'var(--btn-primary-fg-hover)';
        case 'subtle':
          return 'var(--btn-subtle-fg-hover)';
        default:
          return '';
      }
    }};
    background: ${(props) => {
      switch (props.variant) {
        case 'default':
          return 'var(--btn-default-bg-hover)';
        case 'filled':
          return 'var(--btn-primary-bg-hover)';
        case 'subtle':
          return 'var(--btn-subtle-bg-hover)';
        default:
          return '';
      }
    }};
  }

  &:active {
    transform: none;
  }

  & .mantine-Button-centerLoader {
    display: none;
  }

  & .mantine-Button-leftIcon {
    display: flex;
    margin-right: 0.5rem;
  }

  .mantine-Button-rightIcon {
    display: flex;
    margin-left: 0.5rem;
  }
`;

const ButtonChildWrapper = styled.span<{ $loading?: boolean }>`
  color: ${(props) => props.$loading && 'transparent !important'};
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
`;

export const _Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, tooltip, ...props }: ButtonProps, ref) => {
    if (tooltip) {
      return (
        <Tooltip
          withinPortal
          {...tooltip}
        >
          <StyledButton
            ref={ref}
            loaderPosition="center"
            {...props}
          >
            <ButtonChildWrapper $loading={props.loading}>{children}</ButtonChildWrapper>
            {props.loading && (
              <SpinnerWrapper>
                <Spinner />
              </SpinnerWrapper>
            )}
          </StyledButton>
        </Tooltip>
      );
    }

    return (
      <StyledButton
        ref={ref}
        loaderPosition="center"
        {...props}
      >
        <ButtonChildWrapper $loading={props.loading}>{children}</ButtonChildWrapper>
        {props.loading && (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        )}
      </StyledButton>
    );
  },
);

export const Button = createPolymorphicComponent<'button', ButtonProps>(_Button);

_Button.defaultProps = {
  loading: undefined,
  onClick: undefined,
  tooltip: undefined,
};

interface HoldButtonProps extends ButtonProps {
  timeoutProps: {
    callback: () => void;
    duration: number;
  };
}

export const TimeoutButton = ({ timeoutProps, ...props }: HoldButtonProps) => {
  const [, setTimeoutRemaining] = useState(timeoutProps.duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(0);

  const callback = () => {
    timeoutProps.callback();
    setTimeoutRemaining(timeoutProps.duration);
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const { start, clear } = useTimeout(callback, timeoutProps.duration);

  const startTimeout = useCallback(() => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      clear();
    } else {
      setIsRunning(true);
      start();

      const intervalId = window.setInterval(() => {
        setTimeoutRemaining((prev) => prev - 100);
      }, 100);

      intervalRef.current = intervalId;
    }
  }, [clear, isRunning, start]);

  return (
    <Button
      sx={{ color: 'var(--danger-color)' }}
      onClick={startTimeout}
      {...props}
    >
      {isRunning ? 'Cancel' : props.children}
    </Button>
  );
};
