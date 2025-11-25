import React from 'react'

export default function FirstPage() {
  return (
    <div className="font-display">
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 backdrop-overlay">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-center items-center space-x-6 md:space-x-12">
          <img alt="Logo Fecomércio PR" className="h-8 md:h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvxEdnYZ-RyvSci2L1vkrGORbXWep-IDgJs_eKZvtY40Fx42hnQOdb21PuVNCgbOZBO-V7n1AZYo_-j5aLJjiLLhbC2nlyrRnHctoiq8HAe1o2FR-F1DNW51ShWre05NjGuIZp2AzHO0XOSeu-98886Rqkcp10343tzl5Yal4Hj6f496e3JGkc4_9zLdZsshCr9O-3njeL_4Jn8N6H5iNbb8bRvgTO3i6yCES_gGuebhKjY0MPTbILcPvSin8UMsq6BTRMIF5TK4I" />
          <img alt="Logo Sesc" className="h-8 md:h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtOerKyFqPsnaLpsMzyJVL_vf8JYy1cpeEOXM958G-CSVC9Nsa85xF0ICtYHeYCQBuXEgGsTe1OGQ0dJLIhdxKkbJeEXZIFhneSTTFFuTQdDDQGsMc8Gcsxd8K8i5JvM9Lwsfp4FDSglO7rIaBOBRNaM8TQ0ktae_qLOoiw2L4i7YWZXW5Fmqa6V2dlkSS_EIG57n7iUhKt85SlwtOfsMDoSPGyLHqaFVEQG9O0bX73Yjg8l16yE0hxiK5P40uzkR_zcX4TyoR4Gg" />
          <img alt="Logo Senac" className="h-8 md:h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGftC_lTfMGN7zi_kl2BDlAeFKd7avDuZYT7PdC7_-kRhxNH5BQ-z5gUpHrnahtXRvNr_dLdumG6ldg3BVbzeVlfwcAZjCGlE48xr70L6HpspCuKDv8ysvT_Zpl7yA_6AkFMsiSwKC2UJlrFjwxtx4wDEU1AhI_NGe5G6L33yWlIgvgm9X3wJKHghctHmW7y4urAK6KRUj6uCuzs7AxParDInBbnpG3MJYthD5xOSkuxLOP9YSkarerLZFoz3nIY1MzO-Xef1Ddnw" />
        </div>

        <main className="flex flex-col items-center w-full max-w-sm space-y-4">
          <a className="w-full" href="#">
            <button className="w-full bg-primary text-text-primary font-bold py-3 px-6 rounded-lg text-lg tracking-wider shadow-lg hover:opacity-90 transition-opacity">
              CADASTRAR
            </button>
          </a>
          <a className="w-full" href="#">
            <button className="w-full bg-primary text-text-primary font-bold py-3 px-6 rounded-lg text-lg tracking-wider shadow-lg hover:opacity-90 transition-opacity">
              ENTRAR
            </button>
          </a>
        </main>
      </div>
    </div>
  )
}
