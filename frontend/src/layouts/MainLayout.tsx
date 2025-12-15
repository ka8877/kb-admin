import { PropsWithChildren, Fragment, useEffect, useMemo, useState } from 'react';
import { Box, Toolbar, Avatar, Stack, Typography } from '@mui/material';
import AppHeader from '../components/layout/AppHeader';
import GlobalLoadingSpinner from '../components/common/spinner/GlobalLoadingSpinner';
import SideNav from '../components/layout/SideNav';
import { DRAWER_WIDTH } from '../constants';
import type { MenuItem } from '../routes/menu';
import { useAuthStore } from '../store/auth';
import { useLocation } from 'react-router-dom';
import { useIsCurrentPath } from '@/hooks';
import { ROUTES } from '@/routes/menu';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { handleLoginIpCheck } from '@/utils/keycloak';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';

const findBreadcrumb = (menus: MenuItem[], target: string): string[] => {
  const dfs = (list: MenuItem[], acc: string[]): string[] | null => {
    for (const m of list) {
      const nextAcc = [...acc, m.label];
      if (m.path === '/' && target === '/') return nextAcc;
      if (m.path === target || (m.path !== '/' && target.startsWith(m.path + '/'))) {
        if (m.children) {
          const child = dfs(m.children, nextAcc);
          if (child) return child;
        }
        return nextAcc;
      }
      if (m.children) {
        const child = dfs(m.children, nextAcc);
        if (child) return child;
      }
    }
    return null;
  };
  return dfs(menus, []) ?? [];
};

const findActiveTopMenu = (menus: MenuItem[], pathname: string): MenuItem | undefined => {
  return menus.find((m) => {
    if (m.path === '/') return pathname === '/';
    if (m.path === pathname || pathname.startsWith(m.path + '/')) return true;
    if (m.children) {
      const stack: MenuItem[] = [...m.children];
      while (stack.length) {
        const it = stack.pop();
        if (!it) break;
        if (it.path === pathname || (it.path !== '/' && pathname.startsWith(it.path + '/')))
          return true;
        if (it.children) stack.push(...it.children);
      }
    }
    return false;
  });
};

const MainLayout = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const isLoginPage = useIsCurrentPath(ROUTES.LOGIN);
  const [menuRefreshTrigger, setMenuRefreshTrigger] = useState(0);

  useInactivityLogout();

  // IP 체크
  useEffect(() => {
    if (user?.id) handleLoginIpCheck(user.id);
  }, [user?.id]);

  // 메뉴 강제 리프레시 핸들러를 window 객체에 등록
  useEffect(() => {
    (window as any).refreshMenuPermissions = () => {
      setMenuRefreshTrigger((prev) => prev + 1);
    };
    return () => {
      delete (window as any).refreshMenuPermissions;
    };
  }, []);

  const { menus, allowedPaths, menusLoaded } = useMenuPermissions(
    user?.role,
    pathname,
    isLoginPage,
    menuRefreshTrigger,
  );

  const isAllowedPath = useMemo(() => {
    if (pathname === '/') return true;
    return allowedPaths.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/')));
  }, [allowedPaths, pathname]);

  // 메모이제이션된 계산 값들
  const right = useMemo(
    () =>
      user ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 28, height: 28 }}>{user.name?.charAt(0) || '?'}</Avatar>
          <Typography variant="body2" color="text.secondary">
            {user.name} {user.role}
          </Typography>
        </Stack>
      ) : null,
    [user],
  );

  const breadcrumb = useMemo(() => findBreadcrumb(menus, pathname), [menus, pathname]);

  const activeTop = useMemo(() => findActiveTopMenu(menus, pathname), [menus, pathname]);

  const showSideNav = pathname !== '/';

  const sideItems = useMemo(
    () => (activeTop ? [activeTop] : menus.length > 0 ? [menus[0]] : []),
    [activeTop, menus],
  );

  // AppHeader 최상위 메뉴는 3개로 제한하되, 하위 메뉴가 하나도 없으면 숨김
  const headerMenus = useMemo<MenuItem[]>(() => {
    const topSet = new Set<string>([ROUTES.DATA_REG, ROUTES.MANAGEMENT, ROUTES.HISTORY]);
    return menus
      .filter((m) => topSet.has(m.path))
      .filter((m) => (m.children?.length ?? 0) > 0)
      .map((m) => ({ label: m.label, path: m.path, children: m.children }));
  }, [menus]);

  const blockRender = useMemo(() => {
    const shouldRedirect = !isLoginPage && menusLoaded && !isAllowedPath;
    return shouldRedirect || (!menusLoaded && !isLoginPage && pathname !== '/');
  }, [isLoginPage, menusLoaded, isAllowedPath, pathname]);

  const styles = useMemo(
    () => ({
      container: {
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      },
      mainContent: {
        flexGrow: 1,
        pl: '3rem',
        pr: '3rem',
        pt: '2rem',
        pb: '1rem',
        width: showSideNav ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
      },
      innerContent: {
        maxWidth: '100%',
        py: 0,
      },
      breadcrumb: {
        mb: '10px',
      },
    }),
    [showSideNav],
  );

  // 권한 없는 경로 또는 메뉴 로딩 중 보호 경로는 화면을 렌더링하지 않음
  if (blockRender) return null;
  if (isLoginPage) return <>{children}</>;

  return (
    <Box sx={styles.container}>
      <GlobalLoadingSpinner />
      <AppHeader drawerWidth={DRAWER_WIDTH} menus={headerMenus} right={right} />

      {showSideNav && <SideNav drawerWidth={DRAWER_WIDTH} items={sideItems} />}

      <Box component="main" sx={styles.mainContent}>
        {/* push content below AppBar height */}
        <Toolbar />
        <Box sx={styles.innerContent}>
          {/* Breadcrumb / 현재 페이지 설명 텍스트 - 홈이 아닐 때만 표시 */}
          {breadcrumb.length > 0 && pathname !== '/' && (
            <Typography variant="body2" color="text.secondary" sx={styles.breadcrumb}>
              {breadcrumb.map((label, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <Fragment key={index}>
                    {index > 0 && ' / '}
                    <Typography
                      component="span"
                      variant="body2"
                      color={isLast ? 'text.primary' : 'text.secondary'}
                      sx={{ fontWeight: isLast ? 600 : 400 }}
                    >
                      {label}
                    </Typography>
                  </Fragment>
                );
              })}
            </Typography>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
