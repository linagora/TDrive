import { atom, useRecoilState } from "recoil";

export const SearchChannelMemberInputState = atom<string>({
    key: 'SearchChannelMemberInputState',
    default: ''
});

const UsersSearchModalOpenState = atom<boolean>({ 
    key: 'UsersSearchModalOpenState',
    default: false 
});

export const useUsersSearchModal = () => {
    const [open, setOpen] = useRecoilState(UsersSearchModalOpenState);
    return {
        open,
        setOpen,
    };
};
