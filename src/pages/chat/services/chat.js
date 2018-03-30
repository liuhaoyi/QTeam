import request from '../../../utils/request';

export function fetchRosters(){
    return request(`/of/getUsers`);
    // return request(`/api/users?_page=${page}&_limit=${PAGE_SIZE}`);
}
