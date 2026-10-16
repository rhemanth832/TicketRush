import type { Metadata } from 'next';
export const metadata:Metadata={title:'TicketRush — Life happens live.',description:'Discover live experiences, create your own events, and book your place in the crowd.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
