/* eslint-disable @typescript-eslint/no-explicit-any */
interface NavbarProps {
    pages: [string, any][]
    selectedPage: string | null
    setSelectedPage: (page: string) => void
}

export function Navbar({ pages, selectedPage, setSelectedPage }: NavbarProps) {
    return<header className="w-full flex flex-col sticky">

        <div className="w-full flex min-h-32 bg-[#c0cfb2] mx-auto">

            <div className="max-w-360 mx-auto w-full h-full my-auto">
                <img src="/logo.png" alt="Logo" width={200} />
            </div>


        </div>

        <div className="w-full min-h-12 flex h-full bg-[#8ba888] px-6">
            <div className="max-w-360 mx-auto w-full">
                {pages.map(([filename, page]: any) => (
                    <button
                        key={filename}
                        onClick={() => setSelectedPage(filename)}
                        className={"cursor-pointer hover:scale-105 transition-all duration-150 self-center my-auto h-full min-w-24 text-white font-semibold underline-offset-2 " + (selectedPage === filename ? 'underline' : '')}
                    >
                        {page.Meta?.Name || page.Meta?.Title || ''}
                    </button>
                ))}
            </div>
        </div>

    </header>
}