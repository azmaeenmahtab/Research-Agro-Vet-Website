import app from './app';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`[Research Agro Vet API] Express server running at http://localhost:${PORT}`);
  console.log(`[Research Agro Vet API] Environment: ${process.env.NODE_ENV || 'development'}`);
});

