import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Shop from "../pages/shop/page";
import ProductDetail from "../pages/proizvod/page";
import About from "../pages/o-nama/page";
import Contact from "../pages/kontakt/page";
import BlogList from "../pages/blog/page";
import BlogPostDetail from "../pages/blog/post";
import AdminLogin from "../pages/admin/login";
import AdminLayout from "../pages/admin/layout";
import AdminDashboard from "../pages/admin/dashboard";
import AdminProducts from "../pages/admin/products/page";
import AdminCategories from "../pages/admin/categories/page";
import AdminOrders from "../pages/admin/orders/page";
import AdminBlogPosts from "../pages/admin/blog-posts/page";
import AdminBlogCategories from "../pages/admin/blog-categories/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/shop",
    element: <Shop />,
  },
  {
    path: "/proizvod/:id",
    element: <ProductDetail />,
  },
  {
    path: "/o-nama",
    element: <About />,
  },
  {
    path: "/kontakt",
    element: <Contact />,
  },
  {
    path: "/blog",
    element: <BlogList />,
  },
  {
    path: "/blog/:slug",
    element: <BlogPostDetail />,
  },
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "panel", element: <AdminDashboard /> },
      { path: "proizvodi", element: <AdminProducts /> },
      { path: "kategorije", element: <AdminCategories /> },
      { path: "porudzbine", element: <AdminOrders /> },
      { path: "blog-clanci", element: <AdminBlogPosts /> },
      { path: "blog-kategorije", element: <AdminBlogCategories /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;