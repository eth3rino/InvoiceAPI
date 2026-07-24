import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserPayload } from "../types/user-payload.interface";


export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext): UserPayload => {
        const request = context.switchToHttp().getRequest();
        return request.user; // populated by whichever strategy ran (access or refresh)
    }
)