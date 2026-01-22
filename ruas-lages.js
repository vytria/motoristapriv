// ruas-lages.js - Banco de dados de ruas de Lages/SC
const ruasLages = [
    // Centro
    "Rua Benjamin Constant", "Rua Hercílio Luz", "Rua Coronel Córdova", 
    "Rua Lauro Müller", "Rua Frei Gabriel", "Rua Aristiliano Ramos",
    "Rua Dom Pedro II", "Avenida Duque de Caxias", "Rua São Paulo",
    "Rua Sete de Setembro", "Rua Marechal Floriano", "Rua Vidal Ramos",
    
    // Bairro Conta Dinheiro
    "Rua Pedro Júlio Müller", "Rua Tenente Aristiliano Ramos", 
    "Rua Madre Paulina", "Rua Padre Anchieta", "Rua João Goulart",
    "Rua Anita Garibaldi", "Rua Duque de Caxias", "Rua Santos Dumont",
    
    // Bairro Habitação
    "Rua João José Godinho", "Rua José do Patrocínio", "Rua Castro Alves",
    "Rua Olavo Bilac", "Rua Almirante Barroso", "Rua Rui Barbosa",
    "Rua Visconde de Mauá", "Rua Barão do Rio Branco",
    
    // São Francisco
    "Rua São Francisco", "Rua São Sebastião", "Rua São José", 
    "Rua Santa Catarina", "Rua Santa Cruz", "Rua Santa Luzia",
    "Rua Santa Terezinha", "Rua Santa Rita",
    
    // Santa Clara
    "Rua Santa Clara", "Rua São João", "Rua São Pedro", 
    "Rua São Marcos", "Rua São Lucas", "Rua São Mateus",
    
    // Centro Cívico
    "Rua Presidente Nereu Ramos", "Avenida Presidente Vargas",
    "Rua Getúlio Vargas", "Rua Juscelino Kubitschek",
    "Rua Marechal Deodoro", "Rua General Osório",
    
    // Bairro Copacabana
    "Rua Copacabana", "Rua Ipanema", "Rua Leblon", 
    "Rua Botafogo", "Rua Flamengo", "Rua Tijuca",
    
    // Bairro Gethal
    "Rua Gethal", "Rua Otacílio Costa", "Rua Celso Ramos",
    "Rua Ivo Silveira", "Rua Jorge Lacerda", "Rua Irineu Bornhausen",
    
    // Bairro Caroba
    "Rua Caroba", "Rua Ipê", "Rua Jacarandá", 
    "Rua Cedro", "Rua Bracatinga", "Rua Araucária",
    
    // Bairro Petrópolis
    "Rua Petrópolis", "Rua Florianópolis", "Rua Porto Alegre",
    "Rua Curitiba", "Rua São Paulo", "Rua Rio de Janeiro",
    
    // Bairro Universitário
    "Rua Universitária", "Rua dos Estudantes", "Rua da Cultura",
    "Rua do Conhecimento", "Rua da Sabedoria", "Rua da Ciência",
    
    // Bairro São Cristóvão
    "Rua São Cristóvão", "Rua São Miguel", "Rua São Rafael",
    "Rua São Gabriel", "Rua São Bento", "Rua São Luiz",
    
    // Bairro Promorar
    "Rua das Flores", "Rua das Hortênsias", "Rua das Azaleias",
    "Rua das Rosas", "Rua das Margaridas", "Rua das Orquídeas",
    
    // Bairro Triângulo
    "Rua Alfa", "Rua Beta", "Rua Gama", "Rua Delta", "Rua Épsilon",
    
    // Avenidas principais
    "Avenida Belizário Ramos", "Avenida São Francisco", 
    "Avenida Dom Pedro II", "Avenida Duque de Caxias",
    "Avenida Presidente Vargas", "Avenida Rio Grande do Sul",
    
    // Pontos de referência
    "Shopping Center", "Praça João Costa", "Praça da Bandeira",
    "Terminal Rodoviário", "Unoesc", "Uniplac", "Hospital",
    "Prefeitura Municipal", "Fórum", "Lages Garden Shopping",
    "Mercado Público", "Parque Jonas Ramos (Tanque)",
    
    // Ruas por zona
    "Centro", "Conta Dinheiro", "Habitação", "São Francisco", 
    "Santa Clara", "Copacabana", "Gethal", "Caroba", 
    "Petrópolis", "Universitário", "São Cristóvão", 
    "Promorar", "Triângulo", "Centro Cívico"
];

// Distâncias aproximadas entre bairros (em km) para fallback
const distanciasBairros = {
    "Centro-Conta Dinheiro": 2.5,
    "Centro-Habitação": 3.0,
    "Centro-São Francisco": 2.0,
    "Centro-Santa Clara": 4.0,
    "Centro-Copacabana": 3.5,
    "Centro-Gethal": 5.0,
    "Habitação-São Francisco": 2.5,
    "Habitação-Santa Clara": 3.0,
    "Conta Dinheiro-Habitação": 4.0,
    "São Francisco-Santa Clara": 3.5
};
