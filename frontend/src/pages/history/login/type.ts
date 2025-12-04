export type UserLoginItem = {
  no: number;
  loginHistoryId: string; // 로그인이력 PK
  kcUserId: string; // 사용자 FK IX(복합)
  loginAt: string; // 로그인 시각 IX(복합)
  logoutAt: string | null; // 로그아웃 시각
  loginIp: string; // 로그인 IP
  logoutIp: string | null; // 로그아웃 IP
  userAgent: string | null; // 브라우저 정보
  result: string; // 결과
  failReason: string | null; // 실패 사유
};
