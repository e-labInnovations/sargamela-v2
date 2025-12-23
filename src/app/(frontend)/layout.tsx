import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Media as MediaType } from '@/payload-types'

async function getSEOData() {
  const payload = await getPayload({ config: configPromise })
  const seo = await payload.findGlobal({
    slug: 'seo',
    draft: false,
  })
  return seo
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const seo = await getSEOData()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        {/* Favicon */}
        {seo.favicon ? (
          <link
            href={getMediaUrl((seo.favicon as MediaType).url)}
            rel="icon"
            type={(seo.favicon as MediaType).mimeType || 'image/x-icon'}
          />
        ) : (
          <link href="/favicon.ico" rel="icon" sizes="32x32" />
        )}
        {seo.faviconSvg && (
          <link
            href={getMediaUrl((seo.faviconSvg as MediaType).url)}
            rel="icon"
            type="image/svg+xml"
          />
        )}
        {/* Apple Touch Icon */}
        {seo.appleTouchIcon && (
          <link rel="apple-touch-icon" href={getMediaUrl((seo.appleTouchIcon as MediaType).url)} />
        )}
        {/* Theme Color */}
        {seo.themeColor && <meta name="theme-color" content={seo.themeColor} />}
        {/* Google Site Verification */}
        {seo.googleSiteVerification && (
          <meta name="google-site-verification" content={seo.googleSiteVerification} />
        )}
        {/* Keywords */}
        {seo.siteKeywords && <meta name="keywords" content={seo.siteKeywords} />}
        {/* Custom Head Scripts */}
        {seo.customHeadScripts && (
          <div dangerouslySetInnerHTML={{ __html: seo.customHeadScripts }} />
        )}
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOData()

  const ogImage = seo.ogImage
    ? getMediaUrl((seo.ogImage as MediaType).url)
    : `${getServerSideURL()}/website-template-OG.webp`

  return {
    metadataBase: new URL(seo.siteUrl || getServerSideURL()),
    title: {
      default: seo.siteName,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.siteDescription,
    robots: seo.robots ? seo.robots.join(', ') : 'index, follow',
    openGraph: mergeOpenGraph({
      title: seo.ogTitle || seo.siteName,
      description: seo.ogDescription || seo.siteDescription,
      url: seo.siteUrl || getServerSideURL(),
      images: [
        {
          url: ogImage,
        },
      ],
    }),
    twitter: {
      card: (seo.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
      creator: seo.twitterHandle ? `@${seo.twitterHandle}` : undefined,
      site: seo.twitterSite ? `@${seo.twitterSite}` : undefined,
      title: seo.ogTitle || seo.siteName,
      description: seo.ogDescription || seo.siteDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}
