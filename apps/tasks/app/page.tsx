import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import Link from 'next/link'
import styles from './page.module.css'

export default async function Page() {
  const session = await getServerSession(authOptions)

  return (
    <main className={styles.main}>
      <p>Hello world!</p>
      <p>{JSON.stringify(session)}</p>
      <p><Link href='/api/auth/signin'>Sign In</Link></p>
      <p><Link href='/api/auth/signout'>Sign Out</Link></p>
    </main>
  );
}
