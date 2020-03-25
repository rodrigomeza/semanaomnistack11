const connection = require('../database/connection');

module.exports = {
    async index(request, response){

        //Paginação dos itens
        const {page = 1} = request.query;

        //Contagem de itens no banco
        const [count] = await connection('incidents').count();

        //Limitando o numero de itens que aparecerão por pagina
        const incidents = await connection('incidents')
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
        .limit(5)
        .offset((page - 1)*5)
        .select(['incidents.*', 
                'ongs.name',
                'ongs.email',
                'ongs.whatsapp',
                'ongs.city',
                'ongs.uf'
    ]);
        
        //Obtendo o numero de itens do banco para passar para o frontend
        response.header('X-Total-Count', count['count(*)']);

        return response.json(incidents);
    },


    async create(request, response) {
        const { title, description, value } = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        });

        return response.json({ id });
  },

  async delete(request, response){

    const { id } = request.params;
    const ong_id = request.headers.authorization;

    const incident = await connection('incidents')
        .where('id', id)
        .select('ong_id')
        .first();

        if(incident.ong_id != ong_id){
            return response.status(401).json({error: 'Operation not permitted.'});
        }

        await connection('incidents').where('id', id).delete();

        return response.status(204).send();

  }

};