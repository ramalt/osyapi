import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';

@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService
    ) {

    }

    @Post("register")
    @HttpCode(201)
    async register(@Body() registerDto: RegisterDto): Promise<void> {
        await this.userService.createUser(registerDto);

        return;
    }

}
