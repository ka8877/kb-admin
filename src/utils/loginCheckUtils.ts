import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';

interface UserInfoResponse {
  ip: string;
  lastLoginIp?: string;
  lastLoginTime?: string;
}

/**
 * 로그인 후 사용자 IP 체크 및 알림 로직
 * @param userId 사용자 ID
 */
export const checkUserLoginIp = async (userId: string) => {
  try {
    // 1. 사용자 정보 조회 (최근 로그인 IP 포함)
    // const response = await getApi<UserInfoResponse>(API_ENDPOINTS.USER.INFO(userId));
    // const { ip: lastLoginIp, lastLoginTime } = response.data;

    // 테스트용 하드코딩 데이터
    const lastLoginIp: string = '192.168.0.1';
    const lastLoginTime = '2023-12-15 10:00:00';

    // 2. 현재 클라이언트 IP 조회 (외부 서비스 이용)
    // 실제 운영 환경에서는 백엔드 API가 현재 요청의 IP를 반환해주거나, 별도의 IP 확인 API를 사용해야 함
    // 여기서는 예시로 ipify API를 사용 (또는 window.location 등을 활용할 수 없으므로 외부 API 필요)
    // const ipResponse = await fetch('https://api.ipify.org?format=json');
    // const ipData = await ipResponse.json();
    // const currentIp = ipData.ip;

    // 테스트용 하드코딩 데이터 (다르게 설정하여 알림 발생 유도)
    const currentIp: string = '192.168.0.2';

    // 3. 이전 로그인 IP와 현재 IP 비교
    if (lastLoginIp && currentIp !== lastLoginIp) {
      // 4. 다를 경우 알림 메시지 구성 및 반환
      return {
        shouldAlert: true,
        message: `최종 접속 정보와 상이합니다.\n\n최종 접속 IP: ${lastLoginIp}\n최종 접속 시간: ${lastLoginTime || '알 수 없음'}\n현재 접속 IP: ${currentIp}`,
      };
    }

    return { shouldAlert: false };
  } catch (error) {
    console.error('Failed to check user login IP:', error);
    return { shouldAlert: false };
  }
};
