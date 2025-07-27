interface User {
    id: number;
    rate: number;
    email: string;
    pwd: string;
    name: string;
    inviter: number;
}

export default User;