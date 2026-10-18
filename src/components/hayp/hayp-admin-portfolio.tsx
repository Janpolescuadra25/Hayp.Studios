"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FolderKanban, Pencil, Plus, Search, ShieldCheck, Trash2, UploadCloud, UserRound, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const FALLBACK_ADMIN_EMAIL = "paulescuadra25@gmail.com";
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? FALLBACK_ADMIN_EMAIL).toLowerCase();

function isAdminSession(session: ReturnType<typeof useSession>["data"]) {
  const role = (session?.user as { role?: string } | undefined)?.role;
  const email = session?.user?.email?.toLowerCase() ?? "";
  return role === "ADMIN" || email === ADMIN_EMAIL;
}

type MediaRecord = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediaType?: string;
  caption?: string | null;
  displayOrder?: number;
  productId?: string | null;
};

type ArtistRecord = {
  id: string;
  name: string;
  slug?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  socialLinks?: Record<string, string> | null;
  tags?: string[] | null;
  isActive?: boolean;
  _count?: { products: number };
};

type ProductRecord = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  category?: string | null;
  tags?: string[] | null;
  isFeatured?: boolean;
  isArchived?: boolean;
  artistId?: string | null;
  artist?: ArtistRecord | null;
  media?: MediaRecord[];
};

const EMPTY_PRODUCT_FORM = {
  id: "",
  title: "",
  slug: "",
  description: "",
  category: "",
  currency: "USD",
  price: "",
  artistId: "",
  isFeatured: false,
  isArchived: false,
};

const EMPTY_ARTIST_FORM = {
  id: "",
  name: "",
  slug: "",
  bio: "",
  avatarUrl: "",
  bannerUrl: "",
  socialLinks: "",
  tags: "",
  isActive: true,
};

interface HaypAdminPortfolioProps {
  initialProducts?: ProductRecord[];
  initialArtists?: ArtistRecord[];
}

export function HaypAdminPortfolio({
  initialProducts = [],
  initialArtists = [],
}: HaypAdminPortfolioProps) {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [artists, setArtists] = useState<ArtistRecord[]>(initialArtists);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("projects");
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [artistForm, setArtistForm] = useState(EMPTY_ARTIST_FORM);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [artistDialogOpen, setArtistDialogOpen] = useState(false);

  const isAdmin = status === "authenticated" && isAdminSession(session);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadData = async () => {
      try {
        const [artistRes, productRes] = await Promise.all([
          fetch("/api/admin/artists", { headers: { Accept: "application/json" } }),
          fetch("/api/admin/products", { headers: { Accept: "application/json" } }),
        ]);

        if (artistRes.ok) {
          const artistPayload = await artistRes.json();
          setArtists(Array.isArray(artistPayload.artists) ? artistPayload.artists : []);
        }

        if (productRes.ok) {
          const productPayload = await productRes.json();
          setProducts(Array.isArray(productPayload.products) ? productPayload.products : []);
        }
      } catch (error) {
        console.error("Failed to load portfolio admin data:", error);
        toast.error("Unable to load portfolio data.");
      }
    };

    void loadData();
  }, [isAdmin]);

  const categoryOptions = useMemo(() => {
    const values = new Set<string>();
    products.forEach((product) => {
      if (product.category?.trim()) {
        values.add(product.category.trim());
      }
    });
    return ["ALL", ...Array.from(values).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = productSearch.toLowerCase().trim();
      const matchesSearch =
        !searchText ||
        product.title.toLowerCase().includes(searchText) ||
        product.description?.toLowerCase().includes(searchText) ||
        product.artist?.name?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText);

      const matchesCategory = categoryFilter === "ALL" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, productSearch, products]);

  const handleSaveProduct = () => {
    if (!productForm.title.trim()) {
      toast.error("Project title is required.");
      return;
    }

    const nextProduct: ProductRecord = {
      id: productForm.id || `prod-${Date.now()}`,
      slug: productForm.slug || productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      title: productForm.title,
      description: productForm.description || null,
      category: productForm.category || "Uncategorized",
      price: productForm.price ? Number(productForm.price) : null,
      currency: productForm.currency || "USD",
      artistId: productForm.artistId || null,
      isFeatured: productForm.isFeatured,
      isArchived: productForm.isArchived,
      media: [],
      artist: artists.find((artist) => artist.id === productForm.artistId) ?? null,
    };

    setProducts((current) => {
      if (productForm.id) {
        return current.map((product) => (product.id === productForm.id ? nextProduct : product));
      }
      return [nextProduct, ...current];
    });

    setProductDialogOpen(false);
    setProductForm(EMPTY_PRODUCT_FORM);
    toast.success(productForm.id ? "Project updated." : "Project created.");
  };

  const handleSaveArtist = () => {
    if (!artistForm.name.trim()) {
      toast.error("Artist name is required.");
      return;
    }

    const nextArtist: ArtistRecord = {
      id: artistForm.id || `artist-${Date.now()}`,
      slug: artistForm.slug || artistForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      name: artistForm.name,
      bio: artistForm.bio || null,
      avatarUrl: artistForm.avatarUrl || null,
      bannerUrl: artistForm.bannerUrl || null,
      tags: artistForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isActive: artistForm.isActive,
      _count: { products: 0 },
    };

    setArtists((current) => {
      if (artistForm.id) {
        return current.map((artist) => (artist.id === artistForm.id ? nextArtist : artist));
      }
      return [nextArtist, ...current];
    });

    setArtistDialogOpen(false);
    setArtistForm(EMPTY_ARTIST_FORM);
    toast.success(artistForm.id ? "Artist updated." : "Artist created.");
  };

  if (status === "loading") {
    return <div className="p-8 text-sm text-zinc-400">Loading studio controls…</div>;
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl shadow-black/20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Studio operations
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Portfolio Manager — Restricted Access
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-400">
            Authentication as a studio administrator is required to manage resident artists, featured products, and media assets.
          </p>
          <Button className="mt-7" onClick={() => signIn()}>
            Sign In as Studio Admin
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Portfolio manager
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Portfolio Manager</h1>
          <p className="mt-2 text-sm text-zinc-400">Portfolio & Artists</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-300">
            Active admin: <span className="font-medium text-white">{session?.user?.email ?? "studio-admin"}</span>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="media">Media & Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Studio project library</CardTitle>
              </div>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setProductForm(EMPTY_PRODUCT_FORM)}>
                    <Plus className="h-4 w-4" />
                    New project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{productForm.id ? "Edit project" : "Create project"}</DialogTitle>
                    <DialogDescription>Update the featured work, pricing, and artist assignment.</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Title</label>
                      <Input value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Slug</label>
                      <Input value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Category</label>
                      <Input value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Price</label>
                      <Input type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Currency</label>
                      <Select value={productForm.currency} onValueChange={(value) => setProductForm({ ...productForm, currency: value })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="USD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Artist</label>
                      <Select value={productForm.artistId || ""} onValueChange={(value) => setProductForm({ ...productForm, artistId: value })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select artist" />
                        </SelectTrigger>
                        <SelectContent>
                          {artists.map((artist) => (
                            <SelectItem key={artist.id} value={artist.id}>
                              {artist.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Description</label>
                      <Textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveProduct}>{productForm.id ? "Save changes" : "Create project"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    className="pl-9"
                    placeholder="Search projects, artists, categories…"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === "ALL" ? "All categories" : option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-zinc-400">
                          No matching projects found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                                {product.media?.[0]?.thumbnailUrl ? (
                                  <img src={product.media[0].thumbnailUrl} alt={product.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-lg text-zinc-400">
                                    {product.title.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-white">{product.title}</div>
                                <div className="text-xs text-zinc-400">{product.slug}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.artist?.name ?? "Unassigned"}</TableCell>
                          <TableCell>{product.category ?? "—"}</TableCell>
                          <TableCell>{product.price ? new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency ?? "USD" }).format(product.price) : "—"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {product.isFeatured ? <Badge variant="default">Featured</Badge> : null}
                              {product.isArchived ? <Badge variant="secondary">Archived</Badge> : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => {
                                setProductForm({
                                  id: product.id,
                                  title: product.title,
                                  slug: product.slug,
                                  description: product.description ?? "",
                                  category: product.category ?? "",
                                  currency: product.currency ?? "USD",
                                  price: product.price?.toString() ?? "",
                                  artistId: product.artistId ?? "",
                                  isFeatured: product.isFeatured ?? false,
                                  isArchived: product.isArchived ?? false,
                                });
                                setProductDialogOpen(true);
                              }}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <UploadCloud className="h-3.5 w-3.5" />
                                Add media
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => {
                                setProducts((current) => current.filter((item) => item.id !== product.id));
                                toast.info(`Project ${product.title} removed from the local studio list.`);
                              }}>
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Resident artists</CardTitle>
              </div>
              <Dialog open={artistDialogOpen} onOpenChange={setArtistDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setArtistForm(EMPTY_ARTIST_FORM)}>
                    <Plus className="h-4 w-4" />
                    New artist
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{artistForm.id ? "Edit artist" : "Create artist"}</DialogTitle>
                    <DialogDescription>Update resident artist details, social links, and visibility.</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Name</label>
                      <Input value={artistForm.name} onChange={(event) => setArtistForm({ ...artistForm, name: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Slug</label>
                      <Input value={artistForm.slug} onChange={(event) => setArtistForm({ ...artistForm, slug: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-300">Avatar URL</label>
                      <Input value={artistForm.avatarUrl} onChange={(event) => setArtistForm({ ...artistForm, avatarUrl: event.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Bio</label>
                      <Textarea value={artistForm.bio} onChange={(event) => setArtistForm({ ...artistForm, bio: event.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-zinc-300">Tags</label>
                      <Input value={artistForm.tags} onChange={(event) => setArtistForm({ ...artistForm, tags: event.target.value })} />
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setArtistDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveArtist}>{artistForm.id ? "Save changes" : "Create artist"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artist</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-zinc-400">
                          No resident artists yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      artists.map((artist) => (
                        <TableRow key={artist.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 text-sm text-zinc-300">
                                {artist.avatarUrl ? (
                                  <img src={artist.avatarUrl} alt={artist.name} className="h-full w-full object-cover" />
                                ) : (
                                  <UserRound className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-white">{artist.name}</div>
                                <div className="text-xs text-zinc-400">{artist.slug || artist.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {(artist.tags ?? []).map((tag) => (
                                <Badge key={`${artist.id}-${tag}`} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{artist._count?.products ?? 0}</TableCell>
                          <TableCell>
                            <Badge variant={artist.isActive === false ? "secondary" : "default"}>
                              {artist.isActive === false ? "Inactive" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => {
                                setArtistForm({
                                  id: artist.id,
                                  name: artist.name,
                                  slug: artist.slug ?? "",
                                  bio: artist.bio ?? "",
                                  avatarUrl: artist.avatarUrl ?? "",
                                  bannerUrl: artist.bannerUrl ?? "",
                                  socialLinks: artist.socialLinks ? JSON.stringify(artist.socialLinks) : "",
                                  tags: (artist.tags ?? []).join(", "),
                                  isActive: artist.isActive ?? true,
                                });
                                setArtistDialogOpen(true);
                              }}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => {
                                setArtists((current) => current.filter((item) => item.id !== artist.id));
                                toast.info(`Artist ${artist.name} removed from the local list.`);
                              }}>
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media library & upload connector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 p-8 text-center">
                <UploadCloud className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
                <p className="text-lg font-medium text-white">Drop files here or choose artwork</p>
                <p className="mt-2 text-sm text-zinc-400">JPEG, PNG, WebP, AVIF, or MP4 up to 10MB.</p>
                <div className="mt-5 flex justify-center gap-3">
                  <Button variant="outline">Select files</Button>
                  <Button>
                    <Wand2 className="h-4 w-4" />
                    Attach to project
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-zinc-900 font-semibold text-zinc-300">
                        {product.media?.[0]?.thumbnailUrl ? (
                          <img src={product.media[0].thumbnailUrl} alt={product.title} className="h-full w-full object-cover" />
                        ) : (
                          <FolderKanban className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{product.title}</div>
                        <div className="text-xs text-zinc-400">{product.category ?? "Uncategorized"}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <span>Assets</span>
                      <span>{product.media?.length ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
