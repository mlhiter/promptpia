import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { connectToDB } from '@utils/database'
import User from '@models/user'

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      httpOptions: {
        timeout: 50000,
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email,
      })
      session.user.id = sessionUser._id.toString()
      return session
    },
    async signIn({ profile }) {
      try {
        await connectToDB()

        // check if a user already exists
        const userExits = await User.findOne({
          email: profile.email,
        })
        // if not,create a new user
        if (!userExits) {
          await User.create({
            email: profile.email,
            username: profile.name,
            image: profile.avatar_url,
          })
        }
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
  },
})

export { handler as GET, handler as POST }
