export interface MockUser {
    account_id: string;
    username: string;
    role: "company" | "dentist" | "personnel" | "user";
    company_id?: number;
}

const currentMockUser: MockUser = {
    account_id: "ACC-001",
    username: "company_abc",
    role: "company",
    company_id: 1,
};

export const getCurrentUser = (): MockUser => {
    return currentMockUser;
};

export const getCurrentCompanyId = (): number | undefined => {
    return currentMockUser.company_id;
};
