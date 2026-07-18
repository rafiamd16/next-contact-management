const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='container mx-auto px-4 flex justify-center items-center min-h-screen'>
      {children}
    </main>
  )
}

export default AuthLayout
