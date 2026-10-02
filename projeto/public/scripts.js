// Roda no NAVEGADOR (não no Node): carregado por views/layout.html.

/**
 * Abre/fecha o modal "Nova Ideia". Chamada pelos `onclick="onOff()"` nas views.
 * `toggle` adiciona a classe se não existe e remove se existe, então a mesma função abre e fecha.
 *
 * - hide        -> esconde o modal (style.css)
 * - addScroll   -> permite rolar dentro do modal
 * - hideScroll  -> trava a rolagem da página de fundo enquanto o modal está aberto
 */
function onOff() {
    const modal = document.querySelector("#modal")

    modal.classList.toggle("hide")
    modal.classList.toggle("addScroll")
    document.body.classList.toggle("hideScroll")
}
