import { Redirect } from 'expo-router';
import { useAppSelector } from '../src/store/store';

export default function Index() {
  const token = useAppSelector((s) => s.session.token);
  return <Redirect href={token ? '/boards' : '/login'} />;
}
