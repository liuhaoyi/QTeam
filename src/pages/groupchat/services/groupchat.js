import request from '../../../utils/request';

export function fetchGroupByUserName(userName){
    return request(`/of/getGroupByUserName?userName=${userName}`);
}