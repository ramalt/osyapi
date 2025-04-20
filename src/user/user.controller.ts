import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { userResponseDto } from './dto/userResponse.dto';
import { ReqUser } from 'src/common/decorator/user.decorator';
import { User } from './entities/user/user';


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

    @Get('getme')
    @UseGuards(AuthGuard('jwt'))
    async getMe(@ReqUser() user : RequestUser): Promise<userResponseDto> {

        const existing = await this.userService.findById(user.id);

        const res = new userResponseDto();
        res.email = existing.email;
        res.name = existing.name;
        res.createdAt = existing.createdAt;

        return res;

    }

}
