export type UserRoleChangeItem = {
  no: number;
  historyId: number | string; // 권한 변경 이력 PK
  kcUserId: string; // 사용자 FK, IX(복합)
  roleId: string; // 역할 FK, IX(복합)
  changeType: string; // 변경 유형
  itsvcNo: string; // ITSVC 번호
  reason: string; // 변경 사유
  beforeState: string; // 변경전 스냅샷
  afterState: string; // 변경후 스냅샷
  changedBy: string; // 작업자 ID
  changedAt: string; // 변경일시
};
