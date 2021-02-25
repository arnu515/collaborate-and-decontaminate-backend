import { PrimaryGeneratedColumn, Column, BaseEntity, Entity } from "typeorm";

@Entity("users")
class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { nullable: false, length: 2048 })
    email: string;

    @Column("varchar", { nullable: false, length: 256 })
    password: string;

    @Column("varchar", { nullable: false, length: 32 })
    username: string;
}

export default User;
