import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user/user';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {


    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {


    }

    async findByEmail(email: string): Promise<User> {

        const existing = await this.userRepo.findOneBy({ email: email });

        if (!existing) throw new NotFoundException(404, "User cannot be found given email");

        return existing;
    }



    async findById(id: string): Promise<User> {

        const existing = await this.userRepo.findOneBy({ id: id });

        if (!existing) throw new NotFoundException(404, "User cannot be found given id");

        return existing;

    }


    async createUser(userData: RegisterDto): Promise<void> {

        const isExist = await this.userRepo.findOneBy({ email: userData.email });

        if (isExist) throw new ConflictException("user already exist");

        const hashedPassword = await bcrypt.hash(userData.password, 10); 

        const created = this.userRepo.create({
            ...userData,
            password: hashedPassword, 
        });

        console.log("created", created);
        await this.userRepo.save(created);

        return;
    }
}
