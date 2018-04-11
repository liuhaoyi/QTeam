import request from '../../../utils/request';

export function fetchGroupByUserName(userName){
    return request(`/of/getGroupByUserName?userName=${userName}`);
}
export function getGroupMemberByGroupId(groupId){
    return request(`/of/getGroupMemberByGroupId?groupId=${groupId}`);
}

