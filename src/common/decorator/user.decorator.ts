import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) : RequestUser => {
        const request = ctx.switchToHttp().getRequest();

        return request.user ;
    },
);
