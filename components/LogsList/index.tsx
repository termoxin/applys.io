import { FC } from "react";
import styled from "styled-components";

import { LogMessage } from "../../types";

const Container = styled.div`
  padding: 10px 20px 20px 20px;
  background: #efefef;
  border-radius: 2px;
  margin-top: 30px;
`;

const Message = styled.div<MessageProps>`
  font-family: monospace;
  margin-top: 10px;
  color: ${({ error }) => (error ? "red" : "green")};
`;

interface MessageProps {
  error: boolean;
}

interface LogsListProps {
  logs: LogMessage[];
}

export const LogsList: FC<LogsListProps> = ({ logs }) =>
  logs.length ? (
    <Container>
      {logs.map((log, i) => (
        <Message key={i} error={log.error}>
          {new Date().toString()} {log.message}
        </Message>
      ))}
    </Container>
  ) : null;
