export function getBareJid(jid){
    let pos = jid.indexOf('/');
    let bareJid = jid;
    if(pos>0) {
        bareJid = jid.substring(0,pos);
    }
    return bareJid;
}