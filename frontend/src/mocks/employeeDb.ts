// frontend/src/mocks/employeeDb.ts
// 인사정보 목 데이터

export interface EmployeeInfo {
  id: string; // 사번 or ID
  user_name: string; // 이름
  position: string; // 직책
  team_1st: string; // 1차팀
  team_2nd: string; // 2차팀
  email?: string; // 이메일
}

const employeeMockData: EmployeeInfo[] = [
  {
    id: 'jin.b.eum',
    user_name: '변지은',
    position: 'AI 검색 admin',
    team_1st: 'AI사업팀',
    team_2nd: 'AI검색',
    email: 'jin.b.eum@company.com',
  },
  {
    id: 'john.doe',
    user_name: '존 도우',
    position: '팀장',
    team_1st: '개발팀',
    team_2nd: '프론트엔드',
    email: 'john.doe@company.com',
  },
  {
    id: 'jane.smith',
    user_name: '제인 스미스',
    position: '과장',
    team_1st: '개발팀',
    team_2nd: '백엔드',
    email: 'jane.smith@company.com',
  },
  {
    id: 'james.park',
    user_name: '박제임스',
    position: '대리',
    team_1st: '기획팀',
    team_2nd: 'UX/UI',
    email: 'james.park@company.com',
  },
  {
    id: 'julie.kim',
    user_name: '김줄리',
    position: '부장',
    team_1st: '마케팅팀',
    team_2nd: '브랜드',
    email: 'julie.kim@company.com',
  },
  {
    id: 'jack.lee',
    user_name: '이재석',
    position: '사원',
    team_1st: '개발팀',
    team_2nd: '인프라',
    email: 'jack.lee@company.com',
  },
  {
    id: 'kim.minho',
    user_name: '김민호',
    position: '차장',
    team_1st: '영업팀',
    team_2nd: '영업1',
    email: 'kim.minho@company.com',
  },
  {
    id: 'lee.suji',
    user_name: '이수지',
    position: '대리',
    team_1st: '인사팀',
    team_2nd: '채용',
    email: 'lee.suji@company.com',
  },
  {
    id: 'park.jiwon',
    user_name: '박지원',
    position: '과장',
    team_1st: '재무팀',
    team_2nd: '회계',
    email: 'park.jiwon@company.com',
  },
  {
    id: 'choi.yunho',
    user_name: '최윤호',
    position: '팀장',
    team_1st: '기획팀',
    team_2nd: '전략기획',
    email: 'choi.yunho@company.com',
  },
  {
    id: 'jung.sora',
    user_name: '정소라',
    position: '사원',
    team_1st: '개발팀',
    team_2nd: 'QA',
    email: 'jung.sora@company.com',
  },
  {
    id: 'kang.taehyun',
    user_name: '강태현',
    position: '부장',
    team_1st: '개발팀',
    team_2nd: '백엔드',
    email: 'kang.taehyun@company.com',
  },
  {
    id: 'han.jieun',
    user_name: '한지은',
    position: '대리',
    team_1st: 'AI사업팀',
    team_2nd: 'AI연구',
    email: 'han.jieun@company.com',
  },
  {
    id: 'yoon.seokjin',
    user_name: '윤석진',
    position: '과장',
    team_1st: '마케팅팀',
    team_2nd: '퍼포먼스',
    email: 'yoon.seokjin@company.com',
  },
  {
    id: 'lim.hyejin',
    user_name: '임혜진',
    position: '차장',
    team_1st: '기획팀',
    team_2nd: '상품기획',
    email: 'lim.hyejin@company.com',
  },
  {
    id: 'song.minjae',
    user_name: '송민재',
    position: '사원',
    team_1st: '영업팀',
    team_2nd: '영업2',
    email: 'song.minjae@company.com',
  },
  {
    id: 'oh.seoyeon',
    user_name: '오서연',
    position: '팀장',
    team_1st: '인사팀',
    team_2nd: '인사관리',
    email: 'oh.seoyeon@company.com',
  },
  {
    id: 'kwon.donghyun',
    user_name: '권동현',
    position: '부장',
    team_1st: '재무팀',
    team_2nd: '재무기획',
    email: 'kwon.donghyun@company.com',
  },
  {
    id: 'jang.yuna',
    user_name: '장유나',
    position: '대리',
    team_1st: '개발팀',
    team_2nd: '프론트엔드',
    email: 'jang.yuna@company.com',
  },
  {
    id: 'shin.woojin',
    user_name: '신우진',
    position: '과장',
    team_1st: 'AI사업팀',
    team_2nd: 'AI개발',
    email: 'shin.woojin@company.com',
  },
  {
    id: 'cho.eunji',
    user_name: '조은지',
    position: '사원',
    team_1st: '마케팅팀',
    team_2nd: '콘텐츠',
    email: 'cho.eunji@company.com',
  },
  {
    id: 'bae.junsu',
    user_name: '배준수',
    position: '차장',
    team_1st: '개발팀',
    team_2nd: '인프라',
    email: 'bae.junsu@company.com',
  },
  {
    id: 'seo.hana',
    user_name: '서하나',
    position: '팀장',
    team_1st: '영업팀',
    team_2nd: '영업3',
    email: 'seo.hana@company.com',
  },
  {
    id: 'moon.jihoon',
    user_name: '문지훈',
    position: '부장',
    team_1st: '기획팀',
    team_2nd: '사업기획',
    email: 'moon.jihoon@company.com',
  },
  {
    id: 'ahn.sujin',
    user_name: '안수진',
    position: '대리',
    team_1st: '인사팀',
    team_2nd: '교육',
    email: 'ahn.sujin@company.com',
  },
  {
    id: 'go.minseok',
    user_name: '고민석',
    position: '과장',
    team_1st: '재무팀',
    team_2nd: '자금',
    email: 'go.minseok@company.com',
  },
  {
    id: 'nam.jiwoo',
    user_name: '남지우',
    position: '사원',
    team_1st: '개발팀',
    team_2nd: '모바일',
    email: 'nam.jiwoo@company.com',
  },
  {
    id: 'hwang.kyungmin',
    user_name: '황경민',
    position: '차장',
    team_1st: 'AI사업팀',
    team_2nd: '데이터분석',
    email: 'hwang.kyungmin@company.com',
  },
  {
    id: 'ryu.hyunwoo',
    user_name: '류현우',
    position: '팀장',
    team_1st: '마케팅팀',
    team_2nd: '디지털',
    email: 'ryu.hyunwoo@company.com',
  },
  {
    id: 'hong.sooyoung',
    user_name: '홍수영',
    position: '부장',
    team_1st: '개발팀',
    team_2nd: 'DevOps',
    email: 'hong.sooyoung@company.com',
  },
];

export const employeeMockDb = {
  // 전체 목록 조회
  listAll: async (): Promise<EmployeeInfo[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...employeeMockData];
  },

  // 검색 (이름, ID, 이메일로 검색)
  search: async (query: string): Promise<EmployeeInfo[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!query) return [...employeeMockData];

    const lowerQuery = query.toLowerCase();
    return employeeMockData.filter(
      (emp) =>
        emp.user_name.toLowerCase().includes(lowerQuery) ||
        emp.id.toLowerCase().includes(lowerQuery) ||
        (emp.email && emp.email.toLowerCase().includes(lowerQuery)) ||
        emp.position.toLowerCase().includes(lowerQuery) ||
        emp.team_1st.toLowerCase().includes(lowerQuery) ||
        emp.team_2nd.toLowerCase().includes(lowerQuery),
    );
  },

  // ID로 조회
  getById: async (id: string): Promise<EmployeeInfo | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return employeeMockData.find((emp) => emp.id === id) || null;
  },
};
