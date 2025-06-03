import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (process.env.BYPASS_AUTH_FOR_SWAGGER === 'true') {
      const request = context.switchToHttp().getRequest();

      // Assign user from headers (e.g., x-swagger-user-id, x-swagger-user-role) if provided,
      // otherwise use fallback defaults. This allows dynamic user context for Swagger testing.
      let userId: number = 1; // Default user ID if not provided or invalid in headers
      let userRole: UserRole = UserRole.CLIENT; // Default user role if not provided or invalid in headers

      const swaggerUserIdHeader = request.headers['x-swagger-user-id'] as
        | string
        | undefined;
      const swaggerUserRoleHeader = request.headers['x-swagger-user-role'] as
        | string
        | undefined;

      if (swaggerUserIdHeader) {
        const parsedId = parseInt(swaggerUserIdHeader, 10);
        if (!isNaN(parsedId)) {
          userId = parsedId;
        } else {
          // Log a warning if the header is present but its value is not a valid number
          console.warn(
            `[JwtAuthGuard] Swagger Auth Bypass: Invalid 'x-swagger-user-id' header value: "${swaggerUserIdHeader}". Using default ID: ${userId}.`,
          );
        }
      }

      if (swaggerUserRoleHeader) {
        const roleCandidate = swaggerUserRoleHeader.toUpperCase();
        // Validate that the roleCandidate is one of the defined UserRole enum values
        // This assumes UserRole enum values are uppercase strings (e.g., UserRole.CLIENT = 'CLIENT')
        if (Object.values(UserRole).includes(roleCandidate as UserRole)) {
          userRole = roleCandidate as UserRole;
        } else {
          // Log a warning if the header is present but its value is not a valid UserRole
          console.warn(
            `[JwtAuthGuard] Swagger Auth Bypass: Invalid 'x-swagger-user-role' header value: "${swaggerUserRoleHeader}". Valid roles are: ${Object.values(UserRole).join(', ')}. Using default role: ${userRole}.`,
          );
        }
      }

      request.user = {
        sub: userId,
        role: userRole,
      };
      // console.log(`[JwtAuthGuard] Swagger Auth Bypass: User set to ID ${userId}, Role ${userRole}`);
      return true;
    }
    // Proceed with normal JWT authentication if the environment variable is not set
    return super.canActivate(context);
  }
}
