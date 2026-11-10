const domain = process.env.CONVEX_SITE_URL!

export default {
  providers: [
    {
      domain,
      applicationID: 'convex',
    },
  ],
}
