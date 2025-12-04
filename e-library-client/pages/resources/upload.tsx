// import { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/router";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { useRole } from "@/hooks/useAuth";
// import { useCreateResource } from "@/hooks/useResources";
// import { useCourses } from "@/hooks/useCourses";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { createResourceSchema, resourceTypeOptions, categoryOptions, type CreateResourceFormData } from "@/schemas/resources";
// import { motion } from "framer-motion";
// import { Upload, Loader2, FileText, X, ArrowLeft } from "lucide-react";
// import Link from "next/link";

// export default function UploadResourcePage() {
//   const router = useRouter();
//   const { isStaffOrAdmin } = useRole();
//   const { mutate: createResource, isPending } = useCreateResource();
//   const { data: coursesData } = useCourses({ limit: 100 });
//   const courses = coursesData?.data || [];

//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [dragActive, setDragActive] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<CreateResourceFormData>({
//     resolver: zodResolver(createResourceSchema),
//     defaultValues: {
//       isPublic: true,
//     },
//   });

//   useEffect(() => {
//     if (!isStaffOrAdmin) {
//       router.replace("/dashboard");
//     }
//   }, [isStaffOrAdmin, router]);

//   const handleDrag = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   }, []);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       const file = e.dataTransfer.files[0];
//       setSelectedFile(file);
//       setValue("file", file);
//     }
//   }, [setValue]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setSelectedFile(file);
//       setValue("file", file);
//     }
//   };

//   const removeFile = () => {
//     setSelectedFile(null);
//     setValue("file", undefined as unknown as File);
//   };

//   const onSubmit = (data: CreateResourceFormData) => {
//     createResource(data, {
//       onSuccess: () => {
//         router.push("/resources");
//       },
//     });
//   };

//   if (!isStaffOrAdmin) {
//     return null;
//   }

//   return (
//     <DashboardLayout title="Upload Resource">
//       <div className="max-w-2xl mx-auto space-y-6">
//         <Button variant="ghost" asChild className="gap-2">
//           <Link href="/resources">
//             <ArrowLeft className="h-4 w-4" />
//             Back to Resources
//           </Link>
//         </Button>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <Card>
//             <CardHeader>
//               <CardTitle>Upload New Resource</CardTitle>
//               <CardDescription>
//                 Share educational materials with students and staff
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Title</Label>
//                   <Input
//                     id="title"
//                     placeholder="Enter resource title"
//                     {...register("title")}
//                     className={errors.title ? "border-destructive" : ""}
//                   />
//                   {errors.title && (
//                     <p className="text-sm text-destructive">{errors.title.message}</p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     placeholder="Describe this resource..."
//                     rows={4}
//                     {...register("description")}
//                     className={errors.description ? "border-destructive" : ""}
//                   />
//                   {errors.description && (
//                     <p className="text-sm text-destructive">{errors.description.message}</p>
//                   )}
//                 </div>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Resource Type</Label>
//                     <Select onValueChange={(value) => setValue("type", value as CreateResourceFormData["type"])}>
//                       <SelectTrigger className={errors.type ? "border-destructive" : ""}>
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {resourceTypeOptions.map((option) => (
//                           <SelectItem key={option.value} value={option.value}>
//                             {option.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.type && (
//                       <p className="text-sm text-destructive">{errors.type.message}</p>
//                     )}
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Category</Label>
//                     <Select onValueChange={(value) => setValue("category", value)}>
//                       <SelectTrigger className={errors.category ? "border-destructive" : ""}>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categoryOptions.map((option) => (
//                           <SelectItem key={option.value} value={option.value}>
//                             {option.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.category && (
//                       <p className="text-sm text-destructive">{errors.category.message}</p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Course (Optional)</Label>
//                   <Select onValueChange={(value) => setValue("courseId", value)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select course" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {courses.map((course) => (
//                         <SelectItem key={course.id} value={course.id}>
//                           {course.code} - {course.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>File</Label>
//                   <div
//                     className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
//                       dragActive
//                         ? "border-primary bg-primary/5"
//                         : errors.file
//                         ? "border-destructive"
//                         : "border-muted-foreground/25 hover:border-primary/50"
//                     }`}
//                     onDragEnter={handleDrag}
//                     onDragLeave={handleDrag}
//                     onDragOver={handleDrag}
//                     onDrop={handleDrop}
//                   >
//                     {selectedFile ? (
//                       <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
//                         <div className="flex items-center gap-3">
//                           <FileText className="h-8 w-8 text-primary" />
//                           <div className="text-left">
//                             <p className="font-medium truncate max-w-[200px]">
//                               {selectedFile.name}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
//                             </p>
//                           </div>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={removeFile}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
//                         <div>
//                           <p className="font-medium">
//                             Drop your file here or{" "}
//                             <label className="text-primary cursor-pointer hover:underline">
//                               browse
//                               <input
//                                 type="file"
//                                 className="hidden"
//                                 onChange={handleFileChange}
//                                 accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mp3,.wav,.txt,.zip"
//                               />
//                             </label>
//                           </p>
//                           <p className="text-sm text-muted-foreground">
//                             Maximum file size: 50MB
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   {errors.file && (
//                     <p className="text-sm text-destructive">{errors.file.message}</p>
//                   )}
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="isPublic"
//                     checked={watch("isPublic")}
//                     onCheckedChange={(checked) => setValue("isPublic", checked as boolean)}
//                   />
//                   <Label htmlFor="isPublic" className="font-normal cursor-pointer">
//                     Make this resource publicly accessible
//                   </Label>
//                 </div>
//                 <Button type="submit" className="w-full" disabled={isPending}>
//                   {isPending ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Uploading...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="mr-2 h-4 w-4" />
//                       Upload Resource
//                     </>
//                   )}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>
//     </DashboardLayout>
//   );
// }


import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRole } from "@/hooks/useAuth";
import { useCreateResource } from "@/hooks/useResources";
import { useCourses } from "@/hooks/useCourses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createResourceSchema, categoryOptions, accessTypeEnum, type CreateResourceFormData } from "@/schemas/resources";
import { motion } from "framer-motion";
import { Upload, Loader2, FileText, X, ArrowLeft, Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function UploadResourcePage() {
  const router = useRouter();
  const { isStaffOrAdmin } = useRole();
  const { mutate: createResource, isPending } = useCreateResource();
  const { data: coursesData } = useCourses({ limit: 100 });
  const courses = coursesData?.data || [];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [coverDragActive, setCoverDragActive] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);
  const [authorInput, setAuthorInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateResourceFormData>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      accessType: 'DOWNLOADABLE',
      tags: [],
      courseIds: [],
      authors: [],
    },
  });

  useEffect(() => {
    if (!isStaffOrAdmin) {
      router.replace("/dashboard");
    }
  }, [isStaffOrAdmin, router]);

  useEffect(() => {
    setValue("authors", authors);
  }, [authors, setValue]);

  useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);

  useEffect(() => {
    setValue("courseIds", selectedCourses);
  }, [selectedCourses, setValue]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleCoverDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setCoverDragActive(true);
    } else if (e.type === "dragleave") {
      setCoverDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'file' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'file') {
      setDragActive(false);
    } else {
      setCoverDragActive(false);
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (type === 'file') {
        // Validate main file
        const allowedMimes = [
          'application/pdf',
          'application/epub+zip',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];
        
        if (!allowedMimes.includes(file.type)) {
          alert('Invalid file type. Only PDF, EPUB, DOC, DOCX, PPT, and PPTX files are allowed.');
          return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
          alert('File size must be less than 50MB');
          return;
        }
        
        setSelectedFile(file);
        setValue("file", file);
      } else {
        // Validate cover image
        const allowedImageMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif'
        ];
        
        if (!allowedImageMimes.includes(file.type)) {
          alert('Invalid image type. Only JPEG, PNG, WebP, and GIF images are allowed.');
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('Cover image size must be less than 5MB');
          return;
        }
        
        setSelectedCoverImage(file);
        // Note: We need to add coverImage to the schema first
      }
    }
  }, [setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (type === 'file') {
        setSelectedFile(file);
        setValue("file", file);
      } else {
        setSelectedCoverImage(file);
        // Note: We need to add coverImage to the schema first
      }
    }
  };

  const removeFile = (type: 'file' | 'cover') => {
    if (type === 'file') {
      setSelectedFile(null);
      setValue("file", undefined as unknown as File);
    } else {
      setSelectedCoverImage(null);
    }
  };

  const addAuthor = () => {
    if (authorInput.trim()) {
      const newAuthor = authorInput.trim();
      if (!authors.includes(newAuthor)) {
        const newAuthors = [...authors, newAuthor];
        setAuthors(newAuthors);
        setAuthorInput("");
      }
    }
  };

  const removeAuthor = (index: number) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    setAuthors(newAuthors);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        setTagInput("");
      }
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const toggleCourse = (courseId: string) => {
    const newCourses = selectedCourses.includes(courseId)
      ? selectedCourses.filter(id => id !== courseId)
      : [...selectedCourses, courseId];
    setSelectedCourses(newCourses);
  };

  const onSubmit = (data: CreateResourceFormData) => {
    // Prepare FormData
    const formData = new FormData();
    
    // Append all fields
    formData.append("title", data.title);
    if (data.description) {
      formData.append("description", data.description);
    }
    formData.append("category", data.category);
    formData.append("department", data.department);
    formData.append("accessType", data.accessType);
    
    // Handle arrays as separate fields (easier for backend to parse)
    data.authors.forEach((author, index) => {
      formData.append(`authors[${index}]`, author);
    });
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    
    if (data.courseIds && data.courseIds.length > 0) {
      data.courseIds.forEach((courseId, index) => {
        formData.append(`courseIds[${index}]`, courseId);
      });
    }
    
    if (data.publicationYear) {
      formData.append("publicationYear", data.publicationYear.toString());
    }
    
    // Append files
    if (data.file) {
      formData.append("file", data.file);
    }
    
    if (selectedCoverImage) {
      formData.append("coverImage", selectedCoverImage);
    }
    
    // Debug: Log what's being sent
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? `${value.name} (${value.type}, ${value.size} bytes)` : value);
    }
    
    // Call createResource with FormData
    createResource(formData, {
      onSuccess: () => {
        router.push("/resources");
      },
      onError: (error: any) => {
        console.error('Upload error:', error);
        if (error.response?.data?.errors) {
          console.error('Validation errors:', error.response.data.errors);
        }
      },
    });
  };

  if (!isStaffOrAdmin) {
    return null;
  }

  return (
    <DashboardLayout title="Upload Resource">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/resources">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upload New Resource</CardTitle>
              <CardDescription>
                Share educational materials with students and staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter resource title"
                    {...register("title")}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this resource..."
                    rows={4}
                    {...register("description")}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      onValueChange={(value) => setValue("category", value as CreateResourceFormData["category"])}
                    >
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      placeholder="e.g., Computer Science"
                      {...register("department")}
                      className={errors.department ? "border-destructive" : ""}
                    />
                    {errors.department && (
                      <p className="text-sm text-destructive">{errors.department.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publicationYear">Publication Year (Optional)</Label>
                    <Input
                      id="publicationYear"
                      type="number"
                      placeholder="e.g., 2024"
                      {...register("publicationYear", { valueAsNumber: true })}
                      min={1800}
                      max={new Date().getFullYear() + 1}
                      className={errors.publicationYear ? "border-destructive" : ""}
                    />
                    {errors.publicationYear && (
                      <p className="text-sm text-destructive">{errors.publicationYear.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessType">Access Type</Label>
                    <Select 
                      defaultValue="DOWNLOADABLE"
                      onValueChange={(value) => setValue("accessType", value as CreateResourceFormData["accessType"])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select access type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOWNLOADABLE">Downloadable</SelectItem>
                        <SelectItem value="VIEW_ONLY">View Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authors">Authors *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="authorInput"
                        placeholder="Enter author name"
                        value={authorInput}
                        onChange={(e) => setAuthorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAuthor();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addAuthor}
                        disabled={!authorInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {authors.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {authors.map((author, index) => (
                          <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                            <span>{author}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeAuthor(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.authors && (
                    <p className="text-sm text-destructive">{errors.authors.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="tagInput"
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        disabled={!tagInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                            <span>{tag}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeTag(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Related Courses (Optional)</Label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                      {courses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`course-${course.id}`}
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={() => toggleCourse(course.id)}
                          />
                          <Label
                            htmlFor={`course-${course.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {course.code} - {course.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Cover Image (Optional)</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        coverDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                      onDragEnter={handleCoverDrag}
                      onDragLeave={handleCoverDrag}
                      onDragOver={handleCoverDrag}
                      onDrop={(e) => handleDrop(e, 'cover')}
                    >
                      {selectedCoverImage ? (
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <ImageIcon className="h-8 w-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium truncate max-w-[150px]">
                                {selectedCoverImage.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(selectedCoverImage.size / 1024).toFixed(2)} KB • {selectedCoverImage.type}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile('cover')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              Drop cover image here or{" "}
                              <label className="text-primary cursor-pointer hover:underline">
                                browse
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, 'cover')}
                                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                />
                              </label>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Supported: JPEG, PNG, WebP, GIF
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Maximum size: 5MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional: Add a cover image for better presentation
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>File *</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : errors.file
                          ? "border-destructive"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => handleDrop(e, 'file')}
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium truncate max-w-[150px]">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile('file')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              Drop your file here or{" "}
                              <label className="text-primary cursor-pointer hover:underline">
                                browse
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, 'file')}
                                  accept=".pdf,.epub,.doc,.docx,.ppt,.pptx"
                                />
                              </label>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Supported: PDF, EPUB, DOC, DOCX, PPT, PPTX
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Maximum file size: 50MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.file && (
                      <p className="text-sm text-destructive">{errors.file.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resource
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}