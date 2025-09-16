"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamSchema, type CreateTeam } from "@workspace/api";
import { useCreateTeam } from "@/hooks/teams/useCreateTeam";

export default function TeamCreateForm() {
  const create = useCreateTeam();
  const { register, handleSubmit, formState } = useForm<CreateTeam>({
    resolver: zodResolver(CreateTeamSchema),
  });

  function onSubmit(values: CreateTeam) {
    create.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input {...register("name")} placeholder="Team name" className="input" />
      {formState.errors.name && (
        <p className="text-red-600">{formState.errors.name.message}</p>
      )}
      <textarea
        {...register("description")}
        placeholder="Description"
        className="input"
      />
      <button type="submit" className="btn">
        Create
      </button>
    </form>
  );
}
