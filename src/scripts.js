const Modal = {
  // funcionalidade que ativa o modal 
  // o método toggle verifica se o seletor class active está lá ou não. se estiver, ele tira; se não estiver, ele acrescenta
  openClose() {
    document.querySelector('.modal-overlay').classList.toggle('active')
  }
}

// localStorage guarda os dados no próprio navegador, como um banco de dados integrado
const Storage = {
  // pega as informações
  get() {
    // aqui eu preciso retornar a string para array novamente
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  // seta/guarda as informações
  set(transactions) {
    // setItem recebe dois argumentos: chave e valor
    // chave = nome do "banco"
    // valor = transactions em string (pelo JSON)
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

// funcionalidade de entradas, saídas e saldo
const Transaction = {
  all: Storage.get(),

  // adiciona as transações (push). parâmetro transaction
  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  // remove as transações index no array, e apenas uma transação
  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  // montante das entradas
  // pega todas as transações
  // para casa transação, se ela for > 0 
  // somar a uma variável e retorna a variável
  incomes() {
    let income = 0;

    Transaction.all.forEach(transaction => {
      if( transaction.amount > 0 ) {
        income += transaction.amount;
      }
    })

    return income;
  },

  // montante das saídas
  // pega todas as transações
  // para casa transação, se ela for < 0 
  // somar a uma variável e retorna a variável
  expanses() {
    let expanse = 0;

    Transaction.all.forEach(transaction => {
      if( transaction.amount < 0 ) {
        expanse += transaction.amount;
      }
    })

    return expanse;
  },
  total(){

    return Transaction.incomes() + Transaction.expanses();    
  },
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  // cria o elemento tr dinamicamente
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction)

    // appendChild adiciona a classe criada (tr)
    DOM.transactionsContainer.appendChild(tr)
  },

  // substitui os conteúdos na table dinamicamente
  innerHTMLTransaction(transaction, index) {

    // vê se a classe é entrada ou saída, e substitui dinamicamente
    const CSSclass = transaction.amount > 0 ? "income" : "expanse"

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `

    return html
  },

  // substitui dinamicamente os valores no HTML (soma das entradas, soma das saídas e total)
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.getElementById('expanseDisplay').innerHTML = Utils.formatCurrency(Transaction.expanses())
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
  },

  // limpa as transações e evita que no reload() a aplicação popule duas vezes o HTML
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100

    return value
  },

  formatDate(date) {
    // pega a data e divide no traço (-)
    const splittedDate = date.split("-")
    // retorna a data formatada com o index do array
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  // usa um ternary para checar o sinal da transação
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""

    // tudo que estiver entre // é uma expressão regular, e traduzindo-a:
    // \D = tudo que não for número, ela vai substituir por alguma coisa
    // o 'g' indica que é global, então seleciona todas as ocorrências 
    // isso vai tirar os sinais e transformar o value em PURO número
    value = String(value).replace(/\D/g, "")

    // aqui as casas decimais são corrigidas
    value = Number(value) / 100

    // transforma o número em "moeda"
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}

const Form = {
  // pega o elemento inteiro
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  // objeto que pega só os valores do elemento
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  // valida o formulário, garante que todas as informações foram recebidas
  // ou throw uma mensagem de erro
  validateFields() {
    const { description, amount, date } = Form.getValues()

    // trim() varre um espaço vazio, ou seja, transforma em true
    // se o campo = está vazio, então envia mensagem de erro
    if( description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  // pega os valores recebidos e formata
  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  // limpa todos os campos após o preenchimento
  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    // interrompe o comportamento padrão do form
    event.preventDefault()

    // valida o formulário, garantindo que todas as informações foram recebidas
    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      // fecha o modal após preenchimento, já que não é necessário mantê-lo aberto após 
      // coletar os dados do formulário
      // também serve como verificação, uma vez que ele fecha quando os dados são coletados corretamente
      Modal.openClose()
    } catch {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })
    
    DOM.updateBalance()

    Storage.set(Transaction.all)

  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()
