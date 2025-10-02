declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [k: string]: string };
  export default classes;
}
