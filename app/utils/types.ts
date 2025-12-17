export enum StatusCode {
    NO_TOKEN = "40101",              // 无 Token
    INVALID_TOKEN = "40102",         // Token 无效
    EXPIRED_TOKEN = "40103",         // Token 已过期
    USER_NOT_FOUND = "40104",        // 用户不存在
    USER_DISABLED = "40105",         // 账户已禁用
    NO_REFRESH_TOKEN = "40106",      // 无刷新令牌 
    REFRESH_TOKEN_INVALID = "40107", // 刷新令牌无效/过期 
    ADMIN_REQUIRED = "40301",        // 需要管理员权限
    REALNAME_REQUIRED = "40302",     // 需要实名认证
}