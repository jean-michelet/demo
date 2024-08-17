import {
  FastifyPluginAsyncTypebox,
  Type
} from "@fastify/type-provider-typebox";
import {
  TaskSchema,
  Task,
  CreateTaskSchema,
  UpdateTaskSchema,
  PatchTaskStatusSchema
} from "../../../schemas/tasks.js";
import { FastifyReply } from "fastify";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: Type.Array(TaskSchema)
        },
        tags: ["Tasks"]
      }
    },
    async function () {
      const tasks = await fastify.repository.findMany<Task>("tasks");

      return tasks;
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.Number()
        }),
        response: {
          200: TaskSchema,
          404: Type.Object({ message: Type.String() })
        },
        tags: ["Tasks"]
      }
    },
    async function (request, reply) {
      const { id } = request.params;
      const task = await fastify.repository.find<Task>("tasks", { where: { id } });

      if (!task) {
        return notFound(reply);
      }

      return task;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: CreateTaskSchema,
        response: {
          201: {
            id: Type.Number()
          }
        },
        tags: ["Tasks"]
      }
    },
    async function (request, reply) {
      const id = await fastify.repository.create("tasks", { data: request.body });
      reply.code(201);

      return {
        id
      };
    }
  );

  fastify.put(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.Number()
        }),
        body: UpdateTaskSchema,
        response: {
          200: TaskSchema,
          404: Type.Object({ message: Type.String() })
        },
        tags: ["Tasks"]
      }
    },
    async function (request, reply) {
      const { id } = request.params;
      const affectedRows = await fastify.repository.update("tasks", {
        data: request.body,
        where: { id }
      });

      if (affectedRows === 0) {
        return notFound(reply)
      }

      const task = await fastify.repository.find<Task>("tasks", { where: { id } });

      return task as Task;
    }
  );

  fastify.patch(
    "/:id/status",
    {
      schema: {
        params: Type.Object({
          id: Type.Number()
        }),
        body: PatchTaskStatusSchema,
        response: {
          200: Type.Object({ message: Type.String() }),
          404: Type.Object({ message: Type.String() })
        },
        tags: ["Tasks"]
      }
    },
    async function (request, reply) {
      const { id } = request.params;
      const { status } = request.body;

      const affectedRows = await fastify.repository.update("tasks", {
        data: { status },
        where: { id }
      });

      if (affectedRows === 0) {
        return notFound(reply)
      }

      return {
        message: "Status changed"
      };
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.Number()
        }),
        response: {
          204: Type.Null(),
          404: Type.Object({ message: Type.String() })
        },
        tags: ["Tasks"]
      }
    },
    async function (request, reply) {
      const { id } = request.params;
      const affectedRows = await fastify.repository.delete("tasks", { id });

      if (affectedRows === 0) {
        return notFound(reply)
      }

      reply.code(204).send(null);
    }
  );
};

function notFound(reply: FastifyReply) {
  reply.code(404)
  return { message: "Task not found" }
}

export default plugin;
