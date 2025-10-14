"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/toast";
import {
  type UpdateUser,
  type UserProfile,
  UserProfileSchema,
  UpdateUserSchema,
} from "@workspace/api";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useApiQuery } from "@/hooks/api/useApiQuery";
import { useApiMutation } from "@/hooks/api/useApiMutation";

export function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiQuery<UserProfile>(
    ["user-profile"],
    "/users/me",
    UserProfileSchema,
  );

  const updateProfile = useApiMutation<UserProfile, UpdateUser>(
    "/users/me",
    ["user-profile"],
    UpdateUserSchema,
    {
      method: "put",
    },
  );

  const form = useForm<UpdateUser>({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: UpdateUser) => {
    try {
      await updateProfile.mutateAsync(data);
      setIsEditing(false);
      toast.success("Profile updated successfully", {
        description: "Your profile information has been updated.",
        duration: 3000,
      });
    } catch (error: unknown) {
      toast.error("Failed to update profile", {
        description:
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Please try again later.",
        duration: 5000,
      });
    }
  };

  const handleCancel = () => {
    form.reset({
      name: profile?.name || "",
      email: profile?.email || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-6 w-[100px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorDisplay
            error={error as Error}
            onRetry={() => refetch()}
            title="Failed to load profile"
          />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Failed to load profile data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "MEMBER":
        return "default";
      case "VIEWER":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your profile information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter your full name"
              />
            ) : (
              <p className="px-3 py-2 border rounded-md bg-muted">
                {profile.name || "Not provided"}
              </p>
            )}
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter your email address"
              />
            ) : (
              <p className="px-3 py-2 border rounded-md bg-muted">
                {profile.email}
              </p>
            )}
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge
                variant={
                  getRoleBadgeVariant(profile.role) as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                }
              >
                {profile.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your role determines your permissions within teams and projects.
            </p>
          </div>

          {profile.provider && (
            <div className="space-y-2">
              <Label>Account Provider</Label>
              <div>
                <Badge variant="outline">
                  {profile.provider.charAt(0).toUpperCase() +
                    profile.provider.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You signed up using {profile.provider}.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4">
            {isEditing ? (
              <>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
