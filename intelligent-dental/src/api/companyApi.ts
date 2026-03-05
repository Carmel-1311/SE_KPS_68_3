// src/api/companyApi.ts

export interface MobileDentalRequest {
    mobile_dental_id?: number;
    company_id?: number;
    date: string;
    count?: number;
    status?: string;
}

export const getMobileDentalRequests = async (
    companyId?: number
): Promise<MobileDentalRequest[]> => {

    try {
        const params = companyId ? `?company_id=${companyId}` : "";

        const response = await fetch(`/api/mobile_dentals${params}`);

        if (!response.ok) {
            const text = await response.text();
            console.error(
                "Fetch mobile dental requests failed",
                response.status,
                text
            );
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        return data.data ?? [];

    } catch (error) {
        console.error("Failed to fetch mobile dental requests", error);
        return [];
    }
};