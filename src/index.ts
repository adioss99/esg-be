import app from "./server";
const PORT: number = process.env.PORT != null ? parseInt(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at port:${PORT}`);
});
