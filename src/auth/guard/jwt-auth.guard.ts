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
      // Assign a mock user for testing purposes.
      // You can adjust the role as needed for your testing scenarios.
      request.user = {
        sub: 1, // Mock user ID
        role: UserRole.MANAGER, // Mock user role (e.g., manager or admin)
      };
      return true;
    }
    // Proceed with normal JWT authentication if the environment variable is not set
    return super.canActivate(context);
  }
}
