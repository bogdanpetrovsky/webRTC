import { Column, DataType, Model, Table, Unique } from 'sequelize-typescript';

export interface UserInterface {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    about?: string;
    imageUrl?: string;
    interests?: string;
    gender?: string;
    age?: number;
}

export interface UserModelInterface {
    id?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    about?: string;
    imageUrl?: string;
    interests?: string;
    gender?: string;
    age?: number;
}

@Table
export class User extends Model<User> {
    @Column({primaryKey: true})
    id!: number;

    @Unique
    @Column
    email!: string;

    @Column
    password?: string;

    @Column
    firstName?: string;

    @Column
    lastName?: string;

    @Column(DataType.TEXT)
    about?: string;

    @Column
    imageUrl?: string;

    @Column
    gender?: string;

    @Column
    age?: number;

    @Column
    interests?: string;

    toModel(): UserModelInterface {
        const userModel: UserModelInterface = {};
        if (this.id) { userModel.id = this.id; }
        if (this.email) { userModel.email = this.email; }
        if (this.firstName) { userModel.firstName = this.firstName; }
        if (this.lastName) { userModel.lastName = this.lastName; }
        if (this.imageUrl) { userModel.imageUrl = this.imageUrl; }
        if (this.about) { userModel.about = this.about; }
        if (this.interests) { userModel.interests = this.interests; }
        if (this.gender) { userModel.gender = this.gender; }
        if (this.age) { userModel.age = this.age; }

        return userModel;
    }
}
