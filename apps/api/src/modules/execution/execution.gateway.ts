import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }, namespace: '/executions' })
export class ExecutionGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-execution')
  handleJoinExecution(
    @MessageBody() executionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`execution:${executionId}`);
    return { joined: executionId };
  }

  @SubscribeMessage('leave-execution')
  handleLeaveExecution(
    @MessageBody() executionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`execution:${executionId}`);
  }

  emitExecutionUpdate(executionId: string, data: unknown) {
    this.server.to(`execution:${executionId}`).emit('execution-updated', data);
  }

  emitStepUpdate(executionId: string, stepData: unknown) {
    this.server.to(`execution:${executionId}`).emit('step-updated', stepData);
  }
}
