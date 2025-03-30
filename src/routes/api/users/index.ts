import {
  FastifyPluginAsyncTypebox,
  Type
} from '@fastify/type-provider-typebox'
import { UpdateCredentialsSchema } from '../../../schemas/users.js'

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { usersRepository } = fastify
  fastify.put(
    '/update-password',
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: '1 minute'
        }
      },
      schema: {
        body: UpdateCredentialsSchema,
        response: {
          200: Type.Object({
            message: Type.String()
          }),
          401: Type.Object({
            message: Type.String()
          })
        },
        tags: ['Users']
      }
    },
    async function (request, reply) {
      const { newPassword, currentPassword } = request.body
      const { email } = request.session.user

      try {
        const user = await usersRepository.findByEmail(email)

        if (!user) {
          return reply.code(401).send({ message: 'User does not exist.' })
        }

        const isPasswordValid = await fastify.compare(
          currentPassword,
          user.password
        )

        if (!isPasswordValid) {
          return reply.code(401).send({ message: 'Invalid current password.' })
        }

        if (newPassword === currentPassword) {
          reply.status(400)
          return { message: 'New password cannot be the same as the current password.' }
        }

        const hashedPassword = await fastify.hash(newPassword)
        await usersRepository.updatePassword(email, hashedPassword)

        return { message: 'Password updated successfully' }
      } catch (err) {
        console.error(err)
        fastify.log.error(err)
        reply.internalServerError('Failed to update password')
      }
    }
  )
}

export default plugin
