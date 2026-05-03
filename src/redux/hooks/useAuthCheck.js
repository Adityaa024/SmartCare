import { getUserInfo } from '../../service/auth.service';

export default function useAuthCheck() {
    const localAuth = getUserInfo();

    return {
        authChecked: Boolean(localAuth),
        data: localAuth || {},
        role: localAuth?.role || ''
    };
}