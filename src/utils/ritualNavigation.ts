export function skipMorningRitual(router: { replace: (path: string) => void }): void {
  router.replace('/');
}
