import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string } | undefined;

    return next.handle().pipe(
      tap((data) => {
        if (user && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
          const entity = context.getClass().name.replace('Controller', '').toLowerCase();
          const entityId =
            (request.params as Record<string, string>)['id'] ??
            (data as Record<string, unknown> | null)?.['id'] ?? 'unknown';

          this.auditService
            .log({
              userId: user.id,
              action: request.method.toLowerCase(),
              entity,
              entityId: String(entityId),
              ipAddress: request.ip,
            })
            .catch(() => {});
        }
      }),
    );
  }
}
