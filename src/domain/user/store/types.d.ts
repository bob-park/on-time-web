interface UserState {
  currentUser?: User;
  updateCurrentUser: (user: User) => void;
}

